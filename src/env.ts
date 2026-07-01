export type Env = {
  OPENAI_API_KEY: string;
};

export function getEnv(): Env {
  const OPENAI_API_KEY = process.env["OPENAI_API_KEY"];
  if (!OPENAI_API_KEY) {
    throw new Error("環境変数を読み込めませんでした");
  }

  return {
    OPENAI_API_KEY,
  };
}
