export interface IShip {
  position: {
    x: number,
    y: number,
  },
  direction: boolean,
  length: number,
  type: "small" | "medium" | "large" | "huge",
}


export interface IRegRequest {
  name: string,
  password: string,
}

export interface IRegResponce {
  name: string,
  index: number,
  error: boolean,
  errorText: string,
}

export interface IServerMessage<T> {
  type: string,
  data: T,
  id: number
}
