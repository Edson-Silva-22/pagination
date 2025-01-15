import axios from "axios";

const baseURL = "http://localhost:3000/";

export const endPoint = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export async function useApi(
  method: 'get' | 'post' | 'put' | 'delete' | 'options',
  url: string,
  data?: any,
  headers?: any
): Promise<any> {
  try {
    const response = await endPoint.request({
      method,
      url: baseURL + url,
      data,
      headers
    })
    return response
  } catch (error: any) {
    if (error.response) {
      console.error(error.response)
      const errorMessage = JSON.parse(error.request.response).message || 'Erro desconhecido'
      throw new Error(errorMessage).message
    }
  }
}

