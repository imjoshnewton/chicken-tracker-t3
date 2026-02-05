import * as breedsRepo from "../data/breeds.repository";
import { db } from "@lib/db";
import { createId } from "@paralleldrive/cuid2";

export const createBreed = async (data: {
  name: string;
  breed: string;
  description?: string;
  count: number;
  averageProduction: number;
  imageUrl?: string;
  flockId: string;
}) => {
  const id = createId();
  return breedsRepo.createBreed(db, { id, ...data });
};

export const updateBreed = async (data: {
  id: string;
  name?: string | null;
  breed: string;
  description: string;
  count: number;
  averageProduction: number;
  imageUrl: string;
  flockId: string;
}) => {
  return breedsRepo.updateBreed(db, data);
};

export const deleteBreed = async (breedId: string) => {
  return breedsRepo.deleteBreed(db, breedId);
};
