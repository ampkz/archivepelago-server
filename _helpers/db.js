class Locations {
    static COUNTRY = 'COUNTRY';
    static STATE = 'STATE';
    static CITY = 'CITY';
    static ADDRESS = 'ADDRESS';
    static GEO = 'GEO';
    static UPDATE = {
        NAME: `SET l.name = $newName`,
        GEO: `SET l.latitude = $newLatitude, l.longitude = $newLongitude`,
        ADDRESS: `SET l.line1 = $newLine1, l.line2 = $newLine2, l.postalCode = $newPostalCode`
    }
}

const getSessionOptions = function(dbName){
    return {database: `${dbName}${process.env.NODE_ENV ? `${process.env.NODE_ENV}` : ``}`}
}

module.exports = {
    getSessionOptions,
    Locations
}