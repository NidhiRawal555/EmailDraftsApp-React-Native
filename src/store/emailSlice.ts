import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Draft {
  id: string;
  recipient: string;
  subject: string;
  body: string;
  status: 'Draft' | 'Sent';
}

interface EmailState {
  drafts: Draft[];
}

const initialState: EmailState = {
  drafts: [],
};

const emailSlice = createSlice({
  name: 'email',
  initialState,
  reducers: {
    addDraft: (state, action: PayloadAction<Draft>) => {
      state.drafts.push(action.payload);
    },
    setDrafts: (state, action: PayloadAction<Draft[]>) => {
      state.drafts = action.payload;
    },
    updateDraft: (state, action: PayloadAction<Draft>) => {
      const index = state.drafts.findIndex(draft => draft.id === action.payload.id);
      if (index >= 0) {
        state.drafts[index] = action.payload;
      }
    },
  },
});

export const { addDraft, setDrafts, updateDraft } = emailSlice.actions;
export default emailSlice.reducer;
