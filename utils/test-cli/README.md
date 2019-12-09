# @infragen/util-test-cli

This is a generic utility that should be able to test any CLI. It's meant to be used in the context of Jest as it exports mock functions that fire when there's data on `stdout` or `stderr`

## Example Usage

### Run CLI as Bash Command

```typescript
import { ITestGeneratorOutput }, testCLI from '@infragen/util-test-cli';
import { SPACE, DOWN, ENTER } from '@infragen/send-input';


```
