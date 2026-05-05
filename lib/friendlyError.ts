export function getFriendlyErrorMessage(error: unknown) {
  const raw =
    error instanceof Error
      ? error.message
      : typeof error === "string"
      ? error
      : "알 수 없는 오류가 발생했습니다.";

  const message = raw.toLowerCase();

  if (
    message.includes("failed to fetch") ||
    message.includes("fetch") ||
    message.includes("networkerror") ||
    message.includes("network request failed")
  ) {
    return "현재 서버 연결이 원활하지 않습니다. 잠시 후 다시 시도해 주세요.";
  }

  if (
    message.includes("row-level security") ||
    message.includes("permission denied") ||
    message.includes("not allowed") ||
    message.includes("jwt") ||
    message.includes("unauthorized")
  ) {
    return "현재 서비스 접근 권한을 확인하는 중입니다. 잠시 후 다시 시도해 주세요.";
  }

  if (
    message.includes("relation") ||
    message.includes("does not exist") ||
    message.includes("schema")
  ) {
    return "현재 서비스 설정을 확인하는 중입니다. 잠시 후 다시 시도해 주세요.";
  }

  if (
    message.includes("timeout") ||
    message.includes("timed out") ||
    message.includes("gateway")
  ) {
    return "응답이 지연되고 있습니다. 잠시 후 다시 시도해 주세요.";
  }

  if (
    message.includes("invalid api key") ||
    message.includes("apikey") ||
    message.includes("anon key")
  ) {
    return "현재 서버 연결 설정을 확인하는 중입니다. 잠시 후 다시 시도해 주세요.";
  }

  return "현재 서비스 연결이 원활하지 않습니다. 잠시 후 다시 시도해 주세요.";
}