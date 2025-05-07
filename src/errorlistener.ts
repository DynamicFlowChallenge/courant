import {
  type ANTLRErrorListener,
  RecognitionException,
  Recognizer,
} from "antlr4ts";
import { CourantSyntaxError } from "./error";

export class CourantErrorListener implements ANTLRErrorListener<any> {
  syntaxError<T>(
    recognizer: Recognizer<T, any>,
    offendingSymbol: T | undefined,
    line: number,
    charPositionInLine: number,
    msg: string,
    e: RecognitionException | undefined,
  ): void {
    throw new CourantSyntaxError(line, charPositionInLine, msg);
  }
}
