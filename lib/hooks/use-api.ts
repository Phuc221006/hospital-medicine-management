"use client"

import useSWR, { type SWRConfiguration } from "swr"
import { apiClient } from "../api-client"

export function useApi<T>(
  endpoint: string | null,
  params?: Record<string, string | number | boolean | undefined>,
  config?: SWRConfiguration,
) {
  const key = endpoint ? [endpoint, params] : null

  const { data, error, isLoading, isValidating, mutate } = useSWR<T>(
    key,
    async ([url, queryParams]) => {
      return apiClient.get<T>(url as string, queryParams as Record<string, string | number | boolean | undefined>)
    },
    {
      revalidateOnFocus: false,
      ...config,
    },
  )

  return {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
    refresh: () => mutate(),
  }
}
