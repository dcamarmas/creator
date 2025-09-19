// Minimal DOM types for Deno environment
// This file provides just the document types needed for CLI/test environments

declare global {
  var document: {
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
  };
}

export {};