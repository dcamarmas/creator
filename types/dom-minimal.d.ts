// Minimal DOM types for Deno environment
// This file provides just the document types needed for CLI/test environments

interface MinimalElement {
    scrollIntoView(): void;
}

declare global {
    var document:
        | {
              app?: {
                  $root?: {
                      $refs?: {
                          simulatorView?: {
                              $refs?: {
                                  stats?: {
                                      refresh?: () => void;
                                  };
                              };
                          };
                      };
                  };
                  $data?: {
                      callee_frame?: unknown;
                      caller_frame?: unknown;
                  };
              };
              getElementById(id: string): MinimalElement | null;
          }
        | undefined;
}

export {};
