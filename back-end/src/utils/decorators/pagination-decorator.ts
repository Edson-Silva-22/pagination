import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export type PaginationType = {
  page?: number;
  rows?: number;
  sortBy?: string;
  sortOrder?: number;
};

//createParamDecorator: Função usada para criar decoradores personalizados que podem ser aplicados a manipuladores de rotas (controllers).
//ExecutionContext: Usado para acessar o contexto de execução da requisição (por exemplo, acessar o objeto request).
export const Pagination = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): PaginationType => {
    const request = ctx.switchToHttp().getRequest();
    
    let page = parseInt(request.query.page, 10);
    let rows = parseInt(request.query.rows, 10);
    let sortBy: string = request.query.sortBy;
    let sortOrder: number = request.query.sortOrder;

    page = !isNaN(page) && page > 0 ? page : 1;
    rows = !isNaN(rows) && rows > 0 ? rows : 10;
    sortBy = sortBy || 'createdAt';
    sortOrder = sortOrder || -1;

    delete request.query.page;
    delete request.query.rows;
    
    return { page, rows, sortBy, sortOrder};
  },
);