
const { searchBusinesses } =
 require('./providers/google');

async function runIndustryScan({
 industry,
 lat,
 lng,
 radiusKm
}) {

 return await searchBusinesses({
   keyword:industry,
   lat,
   lng,
   radiusMeters:radiusKm * 1000
 });

}

module.exports = {
 runIndustryScan
};
