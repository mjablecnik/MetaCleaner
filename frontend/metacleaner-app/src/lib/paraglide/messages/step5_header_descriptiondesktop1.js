/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Step5_Header_Descriptiondesktop1Inputs */

const en_step5_header_descriptiondesktop1 = /** @type {(inputs: Step5_Header_Descriptiondesktop1Inputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`All metadata successfully removed from ${i?.count} files.`)
};

const cs_step5_header_descriptiondesktop1 = /** @type {(inputs: Step5_Header_Descriptiondesktop1Inputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Všechna metadata byla úspěšně odstraněna ze ${i?.count} souborů.`)
};

/**
* | output |
* | --- |
* | "All metadata successfully removed from {count} files." |
*
* @param {Step5_Header_Descriptiondesktop1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step5_header_descriptiondesktop1 = /** @type {((inputs: Step5_Header_Descriptiondesktop1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step5_Header_Descriptiondesktop1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step5_header_descriptiondesktop1(inputs)
	return cs_step5_header_descriptiondesktop1(inputs)
});
export { step5_header_descriptiondesktop1 as "step5.header.descriptionDesktop" }