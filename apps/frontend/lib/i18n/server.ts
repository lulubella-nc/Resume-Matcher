/**
 * Server-side translation helper.
 *
 * The implementation lives in `./translate` so client components can bind the same
 * function to the content language; this module keeps the import path that the print
 * route and other server code already use.
 */
export { translate } from './translate';
