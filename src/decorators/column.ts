import 'reflect-metadata';

interface ColumnOptions {
  primary?: boolean;
  autoincrement?: boolean;
}

export function Column(options?: ColumnOptions): PropertyDecorator {
  return (target, propertyKey) => {
    const columns = Reflect.getMetadata('columns', target) || [];
    columns.push({ name: propertyKey, options });
    Reflect.defineMetadata('columns', columns, target);
  };
}
