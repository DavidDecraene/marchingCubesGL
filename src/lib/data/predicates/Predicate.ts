export interface Predicate<T>  {
  test: (data: T | undefined) => boolean;
}

class PredicatesImpl {


  public filter<T>(data: T | undefined, filter: Predicate<T>): T | undefined {
    if(!filter.test(data)) return undefined;
    return data;
  }
}

export const Predicates = new PredicatesImpl();
