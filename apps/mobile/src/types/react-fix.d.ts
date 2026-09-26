// React Navigation 6 requiere `refs` en React.Component, que TypeScript 5
// dejó de incluir por defecto. Esta declaración restaura compatibilidad.
import "react";
declare module "react" {
  interface Component<P = object, S = object, SS = unknown> {
    refs: { [key: string]: ReactInstance };
  }
}
