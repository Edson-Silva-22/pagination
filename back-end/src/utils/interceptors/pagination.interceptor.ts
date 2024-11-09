import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
  
  @Injectable()
export class PaginationInterceptor implements NestInterceptor {
  //context: fornece o contexto da requisição, que pode ser usado para acessar informações da requisição e da resposta.
  //next: representa o próximo manipulador na cadeia de execução, permitindo o acesso à resposta antes de ela ser enviada.
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(response => {
        //Verificação da estrutura da resposta: A lógica dentro do map() primeiro verifica se a resposta contém os campos items, totalItems, page e rows, todos necessários para realizar a paginação. Esse trecho garante que o interceptor só modifique respostas que realmente contêm dados paginados.
        if (
          response && 
          response.items && 
          typeof response.totalItems === 'number' && 
          typeof response.page === 'number' && 
          typeof response.rows === 'number'
        ) {
          const { items, totalItems, page, rows } = response;
          const totalPages = Math.ceil(totalItems / rows);
          const hasNextPage = page < totalPages;
          const hasPrevPage = page > 1;
          const returnedItems = items.length;
  
          return {
            metadata: {
              page: page > totalPages ? 1 : page ,
              rows,
              totalItems,
              returnedItems,
              totalPages,
              hasNextPage,
              hasPrevPage,
              nextPage: hasNextPage ? page + 1 : null,
              prevPage: hasPrevPage ? page - 1 : null,
            },
            data: items,
          };
        }
          
        return response;
      }),
    );
  }
}