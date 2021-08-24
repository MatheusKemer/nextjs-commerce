import type {
  OperationContext,
  OperationOptions,
} from '@commerce/api/operations'
import type { Product } from '@commerce/types/product'
import type { GetAllProductPathsOperation } from '@commerce/types/product'
import { requireConfigValue } from '@framework/isomorphic-config'
import type { IProductsSlugs, SpreeSdkVariables } from '@framework/types'
import getProductPath from '@framework/utils/get-product-path'
import type { SpreeApiConfig, SpreeApiProvider } from '..'

export default function getAllProductPathsOperation({
  commerce,
}: OperationContext<SpreeApiProvider>) {
  async function getAllProductPaths<
    T extends GetAllProductPathsOperation
  >(opts?: {
    variables?: T['variables']
    config?: Partial<SpreeApiConfig>
  }): Promise<T['data']>

  async function getAllProductPaths<T extends GetAllProductPathsOperation>(
    opts: {
      variables?: T['variables']
      config?: Partial<SpreeApiConfig>
    } & OperationOptions
  ): Promise<T['data']>

  async function getAllProductPaths<T extends GetAllProductPathsOperation>({
    query,
    variables: getAllProductPathsVariables = {},
    config: userConfig,
  }: {
    query?: string
    variables?: T['variables']
    config?: Partial<SpreeApiConfig>
  } = {}): Promise<T['data']> {
    console.info(
      'getAllProductPaths called. Configuration: ',
      'query: ',
      query,
      'getAllProductPathsVariables: ',
      getAllProductPathsVariables,
      'config: ',
      userConfig
    )

    const productsCount = requireConfigValue(
      'lastUpdatedProductsPrerenderCount'
    )

    if (productsCount === 0) {
      return {
        products: [],
      }
    }

    const variables: SpreeSdkVariables = {
      methodPath: 'products.list',
      arguments: [
        {},
        {
          fields: {
            product: 'slug',
          },
          per_page: productsCount,
        },
      ],
    }

    const config = commerce.getConfig(userConfig)
    const { fetch: apiFetch } = config // TODO: Send config.locale to Spree.

    const {
      data: { data: spreeSuccessResponse },
    } = await apiFetch<{ data: IProductsSlugs }, SpreeSdkVariables>(
      '__UNUSED__',
      {
        variables,
      }
    )

    const normalizedProductsPaths: Pick<Product, 'path'>[] =
      spreeSuccessResponse.data.map((spreeProduct) => ({
        path: getProductPath(spreeProduct),
      }))

    return { products: normalizedProductsPaths }
  }

  return getAllProductPaths
}