import { pipeline } from 'edgeflowjs/pipelines';
import type { FeatureExtractionPipeline } from 'edgeflowjs/pipelines';
import type { ZeroShotClassificationPipeline } from 'edgeflowjs/pipelines';
import type { QuestionAnsweringPipeline } from 'edgeflowjs/pipelines';

export type PipelineStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface PipelineState {
  extractor: PipelineStatus;
  classifier: PipelineStatus;
  qa: PipelineStatus;
}

type StatusListener = (state: PipelineState) => void;

class EdgeFlowManager {
  private _extractor: FeatureExtractionPipeline | null = null;
  private _classifier: ZeroShotClassificationPipeline | null = null;
  private _qa: QuestionAnsweringPipeline | null = null;

  private _extractorPromise: Promise<FeatureExtractionPipeline> | null = null;
  private _classifierPromise: Promise<ZeroShotClassificationPipeline> | null = null;
  private _qaPromise: Promise<QuestionAnsweringPipeline> | null = null;

  private _status: PipelineState = {
    extractor: 'idle',
    classifier: 'idle',
    qa: 'idle',
  };

  private _listeners: StatusListener[] = [];

  private updateStatus(partial: Partial<PipelineState>) {
    this._status = { ...this._status, ...partial };
    this._listeners.forEach(l => l(this._status));
  }

  onStatusChange(listener: StatusListener): () => void {
    this._listeners.push(listener);
    return () => {
      this._listeners = this._listeners.filter(l => l !== listener);
    };
  }

  get status(): PipelineState {
    return this._status;
  }

  async getExtractor(): Promise<FeatureExtractionPipeline> {
    if (this._extractor) return this._extractor;
    if (!this._extractorPromise) {
      this.updateStatus({ extractor: 'loading' });
      this._extractorPromise = pipeline('feature-extraction')
        .then(p => {
          this._extractor = p;
          this.updateStatus({ extractor: 'ready' });
          return p;
        })
        .catch(err => {
          this.updateStatus({ extractor: 'error' });
          this._extractorPromise = null;
          throw err;
        });
    }
    return this._extractorPromise;
  }

  async getClassifier(): Promise<ZeroShotClassificationPipeline> {
    if (this._classifier) return this._classifier;
    if (!this._classifierPromise) {
      this.updateStatus({ classifier: 'loading' });
      this._classifierPromise = pipeline('zero-shot-classification')
        .then(p => {
          this._classifier = p;
          this.updateStatus({ classifier: 'ready' });
          return p;
        })
        .catch(err => {
          this.updateStatus({ classifier: 'error' });
          this._classifierPromise = null;
          throw err;
        });
    }
    return this._classifierPromise;
  }

  async getQA(): Promise<QuestionAnsweringPipeline> {
    if (this._qa) return this._qa;
    if (!this._qaPromise) {
      this.updateStatus({ qa: 'loading' });
      this._qaPromise = pipeline('question-answering')
        .then(p => {
          this._qa = p;
          this.updateStatus({ qa: 'ready' });
          return p;
        })
        .catch(err => {
          this.updateStatus({ qa: 'error' });
          this._qaPromise = null;
          throw err;
        });
    }
    return this._qaPromise;
  }

  async initAll(): Promise<void> {
    await Promise.all([
      this.getExtractor(),
      this.getClassifier(),
      this.getQA(),
    ]);
  }
}

export const edgeflow = new EdgeFlowManager();
