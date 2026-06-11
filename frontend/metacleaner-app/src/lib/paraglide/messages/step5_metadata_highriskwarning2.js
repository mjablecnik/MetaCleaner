/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Step5_Metadata_Highriskwarning2Inputs */

const en_step5_metadata_highriskwarning2 = /** @type {(inputs: Step5_Metadata_Highriskwarning2Inputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`High privacy leak risk! ${i?.count} metadata fields were exposed.`)
};

const cs_step5_metadata_highriskwarning2 = /** @type {(inputs: Step5_Metadata_Highriskwarning2Inputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Vysoké riziko úniku soukromí! ${i?.count} polí metadat bylo odhalitelných.`)
};

/**
* | output |
* | --- |
* | "High privacy leak risk! {count} metadata fields were exposed." |
*
* @param {Step5_Metadata_Highriskwarning2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step5_metadata_highriskwarning2 = /** @type {((inputs: Step5_Metadata_Highriskwarning2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step5_Metadata_Highriskwarning2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step5_metadata_highriskwarning2(inputs)
	return cs_step5_metadata_highriskwarning2(inputs)
});
export { step5_metadata_highriskwarning2 as "step5.metadata.highRiskWarning" }