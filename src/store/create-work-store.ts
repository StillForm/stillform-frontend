import { create } from 'zustand';
import { WorkFormData } from '@/lib/validators/work';
import { Work } from '@/app/api/mock/data';

type State = {
  step: number;
  workType: Work['type'];
  formData: Partial<WorkFormData>;
};

type Actions = {
  setStep: (step: number) => void;
  setWorkType: (type: Work['type']) => void;
  setFormData: (data: Partial<WorkFormData>) => void;
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
  setWorkType: (type) => set({ workType: type }),
  setFormData: (data) => set((state) => ({ formData: { ...state.formData, ...data } })),
  reset: () => set(initialState),
}));
