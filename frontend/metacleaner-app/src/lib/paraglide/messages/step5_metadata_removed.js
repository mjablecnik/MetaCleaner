/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step5_Metadata_RemovedInputs */

const en_step5_metadata_removed = /** @type {(inputs: Step5_Metadata_RemovedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Removed`)
};

const cs_step5_metadata_removed = /** @type {(inputs: Step5_Metadata_RemovedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Odstraněno`)
};

/**
* | output |
* | --- |
* | "Removed" |
*
* @param {Step5_Metadata_RemovedInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step5_metadata_removed = /** @type {((inputs?: Step5_Metadata_RemovedInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step5_Metadata_RemovedInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step5_metadata_removed(inputs)
	return cs_step5_metadata_removed(inputs)
});
export { step5_metadata_removed as "step5.metadata.removed" }