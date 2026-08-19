import { describe, expect, it } from 'vitest';

import { detectLanguage } from './detect-language';

/**
 * The interesting cases are the collisions, not the happy path. YAML in
 * particular overlaps with CSS (a flow mapping reads as a rule block) and with
 * Markdown (a comment reads as a heading), and it was wrong on both before
 * these cases existed.
 */
describe('detectLanguage', () => {
  it.each([
    ['plain mapping', 'name: diff\nversion: 1.0.0\ndescription: text\n'],
    ['nested', 'server:\n  host: localhost\n  tls:\n    enabled: true\n'],
    ['sequence', 'fruits:\n  - apple\n  - banana\n'],
    ['document marker', '---\nkind: Service\nmetadata:\n  name: web\n'],
    ['flow mapping', 'env: { NODE_ENV: production, PORT: 8080 }\nname: api\n'],
    ['flow sequence', 'on:\n  push:\n    branches: [main]\njobs:\n  build:\n    runs-on: ubuntu\n'],
    [
      'template expression',
      'jobs:\n  build:\n    steps:\n      - run: echo "${{ github.sha }}"\n        env:\n          KEY: ${{ secrets.KEY }}\n',
    ],
    [
      'shell block with semicolons',
      'steps:\n  - name: Build\n    run: |\n      pnpm install;\n      pnpm build;\n',
    ],
    [
      'compose file',
      'services:\n  web:\n    image: nginx:alpine\n    ports:\n      - "80:80"\n',
    ],
    ['leading comment', '# Deployment config\nreplicas: 3\nimage: app:latest\n'],
    ['css inside a quoted value', 'styles:\n  inline: "body { color: red; }"\nname: page\n'],
    [
      'css inside a block scalar',
      '---\napiVersion: v1\ndata:\n  app.css: |\n    .card { color: red; }\n',
    ],
  ])('reads %s as yaml', (_label, text) => {
    expect(detectLanguage(text)).toBe('yaml');
  });

  it.each([
    ['rule block', '.card {\n  color: red;\n  padding: 4px;\n}\n'],
    ['at-rule', '@media (min-width: 40rem) {\n  .card { display: grid; }\n}\n'],
    ['custom properties', ':root {\n  --brand: #f00;\n  color-scheme: dark;\n}\n'],
    ['minified', '.a{color:red;margin:0}.b{padding:1px}\n'],
    ['element selector', 'body {\n  margin: 0;\n  font-family: sans-serif;\n}\n'],
  ])('reads %s as css', (_label, text) => {
    expect(detectLanguage(text)).toBe('css');
  });

  it.each([
    ['typescript', 'interface User { name: string }\nexport const x: number = 1;\n'],
    ['typescript', 'type Props = {\n  name: string;\n  age: number;\n};\n'],
    ['tsx', 'export function App() {\n  const n: number = 1;\n  return (\n    <Card>{n}</Card>\n  );\n}\n'],
    ['javascript', 'const x = 1;\nexport function go() { return (x) => x + 1 }\n'],
    ['json', '{\n  "name": "diff",\n  "private": true\n}\n'],
    ['python', 'import os\n\ndef main():\n    print(os.getcwd())\n'],
    ['python', "class Config:\n    name: str = 'x'\n    port: int = 8080\n"],
    ['rust', 'use std::fmt;\n\nfn main() {\n    println!("hi");\n}\n'],
    ['go', 'package main\n\nimport "fmt"\n\nfunc main() {\n\tfmt.Println("hi")\n}\n'],
    ['bash', '#!/usr/bin/env bash\nset -euo pipefail\necho hello\n'],
    ['html', '<!doctype html>\n<html><body><p>hi</p></body></html>\n'],
    ['toml', '[package]\nname = "diff"\nversion = "0.1.0"\n'],
    ['markdown', '# Title\n\nSome text with `code`.\n\n## Section\n'],
    ['markdown', '- first bullet\n- second bullet\n- third bullet\n'],
    ['sql', 'SELECT id, name FROM users WHERE id = 1;\n'],
    ['diff', 'diff --git a/x b/x\n--- a/x\n+++ b/x\n@@ -1 +1 @@\n-a\n+b\n'],
    ['java', 'public class Main {\n  public static void main(String[] a) {\n    System.out.println(1);\n  }\n}\n'],
    ['php', "<?php\necho 'hi';\n"],
  ])('reads a %s sample correctly', (expected, text) => {
    expect(detectLanguage(text)).toBe(expected);
  });

  it('falls back to plain text rather than guessing', () => {
    expect(detectLanguage('Just some prose about nothing.\nA second line.\n')).toBe('text');
    expect(detectLanguage('Dear team:\nPlease review.\nThanks,\nAndrea\n')).toBe('text');
    expect(detectLanguage('')).toBe('text');
  });

  it('prefers the changed side and falls back to the original', () => {
    expect(detectLanguage('', 'name: ci\non: push\n')).toBe('yaml');
    expect(detectLanguage('   ', 'body { color: red; }\n')).toBe('css');
  });
});
