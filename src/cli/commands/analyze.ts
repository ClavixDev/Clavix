import { Command, Args, Flags } from '@oclif/core';
import { UniversalOptimizer } from '../../core/intelligence/index.js';

interface AnalysisResult {
  intent: string;
  confidence: number;
  quality: {
    overall: number;
    clarity: number;
    efficiency: number;
    structure: number;
    completeness: number;
    actionability: number;
    specificity: number;
  };
  escalation: {
    score: number;
    recommend: 'fast' | 'deep' | 'prd';
    factors: string[];
  };
  characteristics: {
    hasCodeContext: boolean;
    hasTechnicalTerms: boolean;
    isOpenEnded: boolean;
    needsStructure: boolean;
  };
}

export default class Analyze extends Command {
  static description =
    'Analyze a prompt and return structured JSON with intent, quality, and escalation data';

  static examples = [
    '<%= config.bin %> <%= command.id %> "Create a login page"',
    '<%= config.bin %> <%= command.id %> "Build an API for user management" --pretty',
  ];

  static flags = {
    pretty: Flags.boolean({
      char: 'p',
      description: 'Pretty-print the JSON output',
      default: false,
    }),
  };

  static args = {
    prompt: Args.string({
      description: 'The prompt to analyze',
      required: true,
    }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Analyze);

    if (!args.prompt || args.prompt.trim().length === 0) {
      const errorOutput = {
        error: 'No prompt provided',
        message: 'Please provide a prompt to analyze',
      };
      console.log(JSON.stringify(errorOutput, null, flags.pretty ? 2 : 0));
      this.exit(1);
      return;
    }

    const optimizer = new UniversalOptimizer();
    const result = await optimizer.optimize(args.prompt, 'fast');

    // Calculate escalation score and recommendation
    const escalation = this.calculateEscalation(result);

    // Build the analysis result
    const analysisResult: AnalysisResult = {
      intent: result.intent.primaryIntent,
      confidence: result.intent.confidence,
      quality: {
        overall: Math.round(result.quality.overall),
        clarity: Math.round(result.quality.clarity),
        efficiency: Math.round(result.quality.efficiency),
        structure: Math.round(result.quality.structure),
        completeness: Math.round(result.quality.completeness),
        actionability: Math.round(result.quality.actionability),
        specificity: Math.round(result.quality.specificity ?? 0),
      },
      escalation,
      characteristics: {
        hasCodeContext: result.intent.characteristics.hasCodeContext,
        hasTechnicalTerms: result.intent.characteristics.hasTechnicalTerms,
        isOpenEnded: result.intent.characteristics.isOpenEnded,
        needsStructure: result.intent.characteristics.needsStructure,
      },
    };

    // Output as JSON
    console.log(JSON.stringify(analysisResult, null, flags.pretty ? 2 : 0));
  }

  private calculateEscalation(result: {
    intent: {
      primaryIntent: string;
      confidence: number;
      characteristics: {
        isOpenEnded: boolean;
        needsStructure: boolean;
        hasTechnicalTerms: boolean;
      };
    };
    quality: { overall: number; clarity: number; completeness: number; actionability: number };
  }): { score: number; recommend: 'fast' | 'deep' | 'prd'; factors: string[] } {
    const factors: string[] = [];
    let score = 0;

    // Quality-based factors
    if (result.quality.overall < 50) {
      score += 30;
      factors.push('low overall quality');
    } else if (result.quality.overall < 65) {
      score += 15;
      factors.push('moderate quality - could be improved');
    }

    if (result.quality.clarity < 50) {
      score += 15;
      factors.push('unclear objective');
    }

    if (result.quality.completeness < 50) {
      score += 20;
      factors.push('missing technical requirements');
    }

    if (result.quality.actionability < 50) {
      score += 15;
      factors.push('vague scope');
    }

    // Intent-based factors
    if (result.intent.primaryIntent === 'planning') {
      score += 15;
      factors.push('planning intent - benefits from exploration');
    }

    if (result.intent.primaryIntent === 'prd-generation') {
      score += 25;
      factors.push('PRD generation - needs strategic planning');
    }

    // Characteristics-based factors
    if (result.intent.characteristics.isOpenEnded && result.intent.characteristics.needsStructure) {
      score += 10;
      factors.push('open-ended without structure');
    }

    // Confidence-based factors
    if (result.intent.confidence < 70) {
      score += 10;
      factors.push('low intent confidence');
    }

    // Determine recommendation based on score and intent
    let recommend: 'fast' | 'deep' | 'prd' = 'fast';

    if (result.intent.primaryIntent === 'prd-generation') {
      recommend = 'prd';
    } else if (score >= 60 || result.quality.overall < 50) {
      recommend = 'deep';
    } else if (score >= 35) {
      recommend = 'deep';
    }

    // Check for strategic keywords that suggest PRD mode
    const strategicIntents = ['planning', 'prd-generation', 'documentation'];
    if (strategicIntents.includes(result.intent.primaryIntent) && score >= 50) {
      recommend = 'prd';
    }

    return {
      score: Math.min(100, score),
      recommend,
      factors,
    };
  }
}
