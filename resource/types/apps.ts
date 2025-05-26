export namespace DB_PROPS {
  export type LINK =
    | ({
        user: {
          name: string;
        } | null;
      } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string | null;
        name: string;
        url: string;
        imageUrl: string | null;
      })
    | null;
}

export type inferType<T> = T extends (...args: any[]) => infer R ? R : never;
