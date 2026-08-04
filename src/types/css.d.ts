declare module "*.css" {
  const content: Record<string, string>;
  export default content;
}

declare module "*.md?raw" {
  const content: string;
  export default content;
}

interface FileSystemDirectoryHandle {
  readonly name: string;
  queryPermission?(descriptor?: {
    mode?: "read" | "readwrite";
  }): Promise<"granted" | "prompt" | "denied">;
  requestPermission?(descriptor?: {
    mode?: "read" | "readwrite";
  }): Promise<"granted" | "prompt" | "denied">;
  values(): AsyncIterableIterator<
    FileSystemDirectoryHandle | FileSystemFileHandle
  >;
  getDirectoryHandle(
    name: string,
    options?: { create?: boolean },
  ): Promise<FileSystemDirectoryHandle>;
  getFileHandle(
    name: string,
    options?: { create?: boolean },
  ): Promise<FileSystemFileHandle>;
}

interface FileSystemFileHandle {
  readonly name: string;
  getFile(): Promise<File>;
  createWritable(options?: { keepExistingData?: boolean }): Promise<unknown>;
}

interface Window {
  showDirectoryPicker?(options?: {
    mode?: "read" | "readwrite";
  }): Promise<FileSystemDirectoryHandle>;
}
