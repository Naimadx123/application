import 'reflect-metadata';

export function Table(name: string): ClassDecorator {
  return target => {
    Reflect.defineMetadata('tableName', name, target);
  };
}
