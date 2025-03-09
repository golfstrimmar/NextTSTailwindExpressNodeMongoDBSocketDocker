import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Auction {
  _id?: string;
  title: string;
  startPrice: number;
  endTime: string;
  imageUrl: string;
  status?: string;
}

interface AuctionsState {
  auctions: Auction[];
}

const initialState: AuctionsState = {
  auctions: [],
};

const auctionsSlice = createSlice({
  name: "auctions",
  initialState,
  reducers: {
    setAuctions(state, action: PayloadAction<Auction[]>) {
      state.auctions = action.payload;
    },
  },
});

export const { setAuctions } = auctionsSlice.actions;
export default auctionsSlice.reducer;
