import { defineStore } from "pinia";
import { useApi } from "@/plugins/httpClient";

export interface FindAllFilmParams {
  page?: number;
  rows?: number;
  title?: string;
  genres?: string;
  type?: string;
}

export const useFilmsStore = defineStore("films", () => {
  async function findAll(params?: FindAllFilmParams) {
    let url = `films/?page=${params?.page}`

    if (params && params.rows) url += `&rows=${params?.rows}`
    if (params && params.title) url += `&title=${params?.title}`
    if (params && params.genres) url += `&genres=${params?.genres}`
    if (params && params.type) url += `&type=${params?.type}`

    const result = await useApi('get', url)
    return result
  }

  return {
    findAll
  }
})