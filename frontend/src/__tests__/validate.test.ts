import { validateSubmissionUri, isValidSubmissionUri } from "@/lib/validate";

function assertValid(uri: string) {
  const result = validateSubmissionUri(uri);
  expect(result.valid).toBe(true);
  expect(isValidSubmissionUri(uri)).toBe(true);
}

function assertInvalid(uri: string) {
  const result = validateSubmissionUri(uri);
  expect(result.valid).toBe(false);
  expect(typeof result.error).toBe("string");
  expect(isValidSubmissionUri(uri)).toBe(false);
}

describe("validateSubmissionUri", () => {
  describe("valid URIs", () => {
    it("accepts valid https URL with path", () => assertValid("https://github.com/user/repo"));
    it("accepts valid https URL with query", () => assertValid("https://example.com/path?query=1"));
    it("accepts valid https with subdomain", () => assertValid("https://sub.example.com"));
    it("accepts ipfs:// URI", () => assertValid("ipfs://QmAbc123Def456"));
    it("accepts ar:// URI", () => assertValid("ar://xyz123abc"));
    it("accepts https with port", () => assertValid("https://example.com:8080/path"));
    it("accepts https with hyphenated domain", () => assertValid("https://my-project.example.com"));
    it("accepts https with path segments", () => assertValid("https://docs.example.com/api/v2/guide"));
  });

  describe("rejected — scheme", () => {
    it("rejects http://", () => assertInvalid("http://example.com"));
    it("rejects ftp://", () => assertInvalid("ftp://example.com"));
    it("rejects file://", () => assertInvalid("file:///etc/passwd"));
    it("rejects no scheme", () => assertInvalid("example.com"));
  });

  describe("rejected — malformed hostname", () => {
    it("rejects https://abc (no TLD)", () => assertInvalid("https://abc"));
    it("rejects https://example (no TLD)", () => assertInvalid("https://example"));
    it("rejects https://. (empty label)", () => assertInvalid("https://."));
    it("rejects https://.. (double dot)", () => assertInvalid("https://.."));
    it("rejects https:///example.com (no hostname)", () => assertInvalid("https:///example.com"));
    it("rejects https://google,com (comma)", () => assertInvalid("https://google,com"));
  });

  describe("rejected — whitespace", () => {
    it("rejects https:// example.com (space in hostname)", () => assertInvalid("https://example.com "));
    it("rejects leading space", () => assertInvalid(" https://example.com"));
  });

  describe("rejected — blocked/internal hosts", () => {
    it("rejects localhost", () => assertInvalid("https://localhost"));
    it("rejects localhost with port", () => assertInvalid("https://localhost:3000"));
    it("rejects 127.0.0.1", () => assertInvalid("https://127.0.0.1"));
    it("rejects 192.168.1.1", () => assertInvalid("https://192.168.1.1"));
    it("rejects 10.0.0.1", () => assertInvalid("https://10.0.0.1"));
    it("rejects 172.16.0.1", () => assertInvalid("https://172.16.0.1"));
    it("rejects 0.0.0.0", () => assertInvalid("https://0.0.0.0"));
    it("rejects [::1]", () => assertInvalid("https://[::1]"));
    it("rejects 169.254.1.1 (link-local)", () => assertInvalid("https://169.254.1.1"));
  });

  describe("rejected — dangerous patterns", () => {
    it("rejects javascript: URL", () => assertInvalid("javascript:alert(1)"));
    it("rejects script injection", () => assertInvalid("https://example.com/<script>"));
    it("rejects data: URL", () => assertInvalid("data:text/html,<script>alert(1)</script>"));
    it("rejects vbscript: URL", () => assertInvalid("vbscript:msgbox"));
  });

  describe("edge cases", () => {
    it("rejects empty string", () => assertInvalid(""));
    it("rejects too long URI", () => {
      const long = "https://example.com/" + "a".repeat(200);
      assertInvalid(long);
    });
    it("rejects just whitespace", () => assertInvalid("   "));
  });
});
