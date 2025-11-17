/**
 * SessionManager - Manages conversational sessions for clavix start/summarize
 *
 * This class handles:
 * - Session creation with unique IDs
 * - Message tracking and storage
 * - Session file persistence (JSON format)
 * - Session listing, filtering, and search
 * - CRUD operations for sessions
 *
 * Sessions are stored in `.clavix/sessions/` as JSON files:
 * `.clavix/sessions/{session-id}.json`
 */

import fs from 'fs-extra';
import * as path from 'path';
import { FileSystem } from '../utils/file-system.js';
import { v4 as uuidv4 } from 'uuid';
import {
  Session,
  SessionMessage,
  SessionMetadata,
  SessionFilter,
  SerializedSession,
} from '../types/session.js';

/**
 * Options for creating a new session
 */
export interface CreateSessionOptions {
  projectName?: string;
  agent?: string;
  description?: string;
  tags?: string[];
}

/**
 * SessionManager class
 *
 * Manages all session-related operations including creation, storage,
 * retrieval, listing, and search functionality.
 */
export class SessionManager {
  private readonly sessionsDir: string;
  private readonly defaultSessionsDir = '.clavix/sessions';

  constructor(sessionsDir?: string) {
    this.sessionsDir = sessionsDir || this.defaultSessionsDir;
  }

  /**
   * Create a new session
   *
   * @param options - Session creation options
   * @returns The created session
   */
  async createSession(options: CreateSessionOptions = {}): Promise<Session> {
    const now = new Date();
    const session: Session = {
      id: uuidv4(),
      projectName: options.projectName || this.generateDefaultProjectName(),
      agent: options.agent || 'Claude Code',
      created: now,
      updated: now,
      status: 'active',
      messages: [],
      tags: options.tags,
      description: options.description,
    };

    await this.saveSession(session);
    return session;
  }

  /**
   * Get a session by ID
   *
   * @param sessionId - The session ID
   * @returns The session, or null if not found
   */
  async getSession(sessionId: string): Promise<Session | null> {
    try {
      const sessionPath = this.getSessionPath(sessionId);
      const exists = await fs.pathExists(sessionPath);

      if (!exists) {
        return null;
      }

      const serialized = await fs.readJSON(sessionPath) as SerializedSession;
      return this.deserializeSession(serialized);
    } catch {
      return null;
    }
  }

  /**
   * Save a session to disk
   *
   * @param session - The session to save
   */
  async saveSession(session: Session): Promise<void> {
    await FileSystem.ensureDir(this.sessionsDir);

    const sessionPath = this.getSessionPath(session.id);
    const serialized = this.serializeSession(session);

    // Use atomic write to prevent corruption
    await FileSystem.writeFileAtomic(
      sessionPath,
      JSON.stringify(serialized, null, 2)
    );
  }

  /**
   * Update a session
   *
   * @param sessionId - The session ID
   * @param updates - Partial session updates
   * @returns The updated session, or null if not found
   */
  async updateSession(
    sessionId: string,
    updates: Partial<Omit<Session, 'id' | 'created'>>
  ): Promise<Session | null> {
    const session = await this.getSession(sessionId);
    if (!session) {
      return null;
    }

    const updatedSession: Session = {
      ...session,
      ...updates,
      id: session.id,
      created: session.created,
      updated: new Date(),
    };

    await this.saveSession(updatedSession);
    return updatedSession;
  }

  /**
   * Delete a session
   *
   * @param sessionId - The session ID
   * @returns True if deleted, false if not found
   */
  async deleteSession(sessionId: string): Promise<boolean> {
    const sessionPath = this.getSessionPath(sessionId);
    const exists = await fs.pathExists(sessionPath);

    if (!exists) {
      return false;
    }

    await fs.remove(sessionPath);
    return true;
  }

  /**
   * Add a message to a session
   *
   * @param sessionId - The session ID
   * @param role - Message role (user or assistant)
   * @param content - Message content
   * @returns The updated session, or null if session not found
   */
  async addMessage(
    sessionId: string,
    role: 'user' | 'assistant',
    content: string
  ): Promise<Session | null> {
    const session = await this.getSession(sessionId);
    if (!session) {
      return null;
    }

    const message: SessionMessage = {
      role,
      content,
      timestamp: new Date(),
    };

    session.messages.push(message);
    session.updated = new Date();

    await this.saveSession(session);
    return session;
  }

  /**
   * List all sessions with optional filtering
   *
   * @param filter - Optional filter criteria
   * @returns Array of session metadata
   */
  async listSessions(filter?: SessionFilter): Promise<SessionMetadata[]> {
    await FileSystem.ensureDir(this.sessionsDir);

    const files = await fs.readdir(this.sessionsDir);
    const sessionFiles = files.filter((f) => f.endsWith('.json'));

    const sessions: SessionMetadata[] = [];

    for (const file of sessionFiles) {
      try {
        const sessionPath = path.join(this.sessionsDir, file);
        const serialized = await fs.readJSON(sessionPath) as SerializedSession;
        const metadata = this.extractMetadata(serialized);

        // Apply filters
        if (filter && !this.matchesFilter(metadata, filter)) {
          continue;
        }

        sessions.push(metadata);
      } catch {
        // Skip corrupted session files
        continue;
      }
    }

    // Sort by updated date (most recent first)
    sessions.sort((a, b) => {
      return new Date(b.updated).getTime() - new Date(a.updated).getTime();
    });

    return sessions;
  }

  /**
   * Search sessions by keyword
   *
   * Searches in project name, description, tags, and message content
   *
   * @param keyword - Search keyword
   * @returns Array of matching session metadata
   */
  async searchSessions(keyword: string): Promise<SessionMetadata[]> {
    await FileSystem.ensureDir(this.sessionsDir);

    const files = await fs.readdir(this.sessionsDir);
    const sessionFiles = files.filter((f) => f.endsWith('.json'));

    const matches: SessionMetadata[] = [];
    const lowerKeyword = keyword.toLowerCase();

    for (const file of sessionFiles) {
      try {
        const sessionPath = path.join(this.sessionsDir, file);
        const serialized = await fs.readJSON(sessionPath) as SerializedSession;

        // Search in project name
        if (serialized.projectName.toLowerCase().includes(lowerKeyword)) {
          matches.push(this.extractMetadata(serialized));
          continue;
        }

        // Search in description
        if (serialized.description?.toLowerCase().includes(lowerKeyword)) {
          matches.push(this.extractMetadata(serialized));
          continue;
        }

        // Search in tags
        if (serialized.tags?.some((tag) => tag.toLowerCase().includes(lowerKeyword))) {
          matches.push(this.extractMetadata(serialized));
          continue;
        }

        // Search in message content
        const hasMessageMatch = serialized.messages.some((msg) =>
          msg.content.toLowerCase().includes(lowerKeyword)
        );

        if (hasMessageMatch) {
          matches.push(this.extractMetadata(serialized));
        }
      } catch {
        // Skip corrupted session files
        continue;
      }
    }

    // Sort by updated date (most recent first)
    matches.sort((a, b) => {
      return new Date(b.updated).getTime() - new Date(a.updated).getTime();
    });

    return matches;
  }

  /**
   * Get the most recent active session
   *
   * @returns The active session, or null if none exists
   */
  async getActiveSession(): Promise<Session | null> {
    const activeSessions = await this.listSessions({ status: 'active' });

    if (activeSessions.length === 0) {
      return null;
    }

    // Return the most recently updated active session
    return this.getSession(activeSessions[0].id);
  }

  /**
   * Mark a session as completed
   *
   * @param sessionId - The session ID
   * @returns The updated session, or null if not found
   */
  async completeSession(sessionId: string): Promise<Session | null> {
    return this.updateSession(sessionId, { status: 'completed' });
  }

  /**
   * Mark a session as archived
   *
   * @param sessionId - The session ID
   * @returns The updated session, or null if not found
   */
  async archiveSession(sessionId: string): Promise<Session | null> {
    return this.updateSession(sessionId, { status: 'archived' });
  }

  /**
   * Get the path to a session file
   */
  private getSessionPath(sessionId: string): string {
    return path.join(this.sessionsDir, `${sessionId}.json`);
  }

  /**
   * Generate a default project name based on timestamp
   */
  private generateDefaultProjectName(): string {
    const date = new Date();
    const timestamp = date.toISOString().split('T')[0]; // YYYY-MM-DD
    return `session-${timestamp}`;
  }

  /**
   * Serialize a session for file storage
   */
  private serializeSession(session: Session): SerializedSession {
    return {
      id: session.id,
      projectName: session.projectName,
      agent: session.agent,
      created: session.created.toISOString(),
      updated: session.updated.toISOString(),
      status: session.status,
      messages: session.messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp.toISOString(),
      })),
      tags: session.tags,
      description: session.description,
    };
  }

  /**
   * Deserialize a session from file storage
   */
  private deserializeSession(serialized: SerializedSession): Session {
    return {
      id: serialized.id,
      projectName: serialized.projectName,
      agent: serialized.agent,
      created: new Date(serialized.created),
      updated: new Date(serialized.updated),
      status: serialized.status,
      messages: serialized.messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.timestamp),
      })),
      tags: serialized.tags,
      description: serialized.description,
    };
  }

  /**
   * Extract metadata from a serialized session
   */
  private extractMetadata(serialized: SerializedSession): SessionMetadata {
    return {
      id: serialized.id,
      projectName: serialized.projectName,
      agent: serialized.agent,
      created: serialized.created,
      updated: serialized.updated,
      status: serialized.status,
      messageCount: serialized.messages.length,
      tags: serialized.tags,
      description: serialized.description,
    };
  }

  /**
   * Check if session metadata matches filter criteria
   */
  private matchesFilter(
    metadata: SessionMetadata,
    filter: SessionFilter
  ): boolean {
    // Status filter
    if (filter.status && metadata.status !== filter.status) {
      return false;
    }

    // Project name filter
    if (filter.projectName && metadata.projectName !== filter.projectName) {
      return false;
    }

    // Agent filter
    if (filter.agent && metadata.agent !== filter.agent) {
      return false;
    }

    // Tags filter (session must have ALL specified tags)
    if (filter.tags && filter.tags.length > 0) {
      if (!metadata.tags || metadata.tags.length === 0) {
        return false;
      }
      const hasAllTags = filter.tags.every((tag) => metadata.tags!.includes(tag));
      if (!hasAllTags) {
        return false;
      }
    }

    // Date range filters
    const updatedDate = new Date(metadata.updated);

    if (filter.startDate && updatedDate < filter.startDate) {
      return false;
    }

    if (filter.endDate && updatedDate > filter.endDate) {
      return false;
    }

    return true;
  }
}
