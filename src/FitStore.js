import { observable, action } from 'mobx';

import FitService from './FitService';

class FitStore {
  @observable isAvailable = null;
  @observable initializing = false;
  @observable initializingError = false;
  @observable initialized = false;
  @observable stepCount = 0;
  @observable error = null;

  @action checkAvailable = async () => {
    const isAvailable = await FitService.isAvailable();

    this.isAvailable = isAvailable;
  }

  @action initialize = async () => {
    this.initializing = true;
    this.initializingError = false;

    try {
      await FitService.initialize();

      this.initialized = true;
    } catch (e) {
      this.initializingError = true;
    } finally {
      this.initializing = false;
    }

    try {
      FitService.subscribe(async () => {
        const nextSteps = await FitService.getSteps();

        this.stepCount = Math.floor(nextSteps.value);
      });
    } catch (e) {
      const error = 'Step update failed.';

      this.error = error;
    }

    try {
      const stepCount = await FitService.getSteps();

      this.stepCount = Math.floor(stepCount.value);
    } catch (e) {
      const error = 'Get steps failed.';

      this.error = error;
    }
  }
}

export default new FitStore();
