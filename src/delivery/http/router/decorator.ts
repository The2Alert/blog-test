export function Router(path: string) {
  return function (Router: any): any {
    return class extends Router {
      public path = path;
      public routerName = Router.name.replace('Router', '');
    };
  };
}
