/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step4_Type_Connection_DescriptionInputs */

const en_step4_type_connection_description = /** @type {(inputs: Step4_Type_Connection_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Communication with the processing service was interrupted.`)
};

const cs_step4_type_connection_description = /** @type {(inputs: Step4_Type_Connection_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Komunikace se službou zpracování byla přerušena.`)
};

/**
* | output |
* | --- |
* | "Communication with the processing service was interrupted." |
*
* @param {Step4_Type_Connection_DescriptionInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step4_type_connection_description = /** @type {((inputs?: Step4_Type_Connection_DescriptionInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step4_Type_Connection_DescriptionInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step4_type_connection_description(inputs)
	return cs_step4_type_connection_description(inputs)
});
export { step4_type_connection_description as "step4.type.connection.description" }