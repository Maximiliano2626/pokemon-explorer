import {
  type ArgumentsHost,
  BadGatewayException,
  Catch,
  type ExceptionFilter,
  GatewayTimeoutException,
  NotFoundException,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  PokemonNotFoundError,
  PokemonSourceUnavailableError,
} from '../../domain/pokemon.errors.js';

/**
 * Traduce los errores del dominio a respuestas HTTP.
 *   PokemonNotFoundError                  -> 404
 *   PokemonSourceUnavailableError(error)  -> 502
 *   PokemonSourceUnavailableError(timeout)-> 504
 */
@Catch(PokemonNotFoundError, PokemonSourceUnavailableError)
export class PokemonExceptionFilter implements ExceptionFilter {
  catch(
    error: PokemonNotFoundError | PokemonSourceUnavailableError,
    host: ArgumentsHost,
  ): void {
    const httpError =
      error instanceof PokemonNotFoundError
        ? new NotFoundException(error.message)
        : error.reason === 'timeout'
          ? new GatewayTimeoutException(error.message)
          : new BadGatewayException(error.message);

    host
      .switchToHttp()
      .getResponse<Response>()
      .status(httpError.getStatus())
      .json(httpError.getResponse());
  }
}