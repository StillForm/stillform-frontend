import { create } from 'zustand';
import { WorkFormData } from '@/lib/validators/work';
import { Work } from '@/app/api/mock/data';
import { produce } from 'immer';

// Extend formData to hold the raw file for delayed upload
export type FormDataWithFile = Partial<WorkFormData> & {
  rawFile?: File;
};

type State = {
  step: number;
  workType: Work['type'];
  formData: FormDataWithFile;
};

type Actions = {
  setStep: (step: number) => void;
  setWorkType: (type: Work['type']) => void;
  setFormData: (data: FormDataWithFile) => void;
  reset: () => void;
};

const initialState: State = {
  step: 1,
  workType: 'standard',
  formData: {},
};

export const useCreateWorkStore = create<State & Actions>((set) => ({
  ...initialState,
  setStep: (step) => set({ step }),
  setWorkType: (type) => set({ workType: type, step: 2, formData: {} }), // Reset form on type change
  setFormData: (data) => {
    console.log("Updating form data in store with:", JSON.stringify(data, null, 2));
    set(
      produce((draft: State) => {
        // Use Immer for safe and easy deep merging
        Object.assign(draft.formData, data);
        console.log("New state after update:", JSON.stringify(draft.formData, null, 2));
      })
    );
  },
  reset: () => set({ ...initialState, formData: {} }),
}));
