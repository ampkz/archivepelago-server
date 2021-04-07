const neo4j = require('neo4j-driver');
const { ArchiveError, InternalError, DBError } = require('../_helpers/errors');
const { getSessionOptions } = require('../_helpers/db');

function connect(){
    let driver;
    try{
       // eslint-disable-next-line no-undef
       driver = neo4j.driver(`bolt://${process.env.NEO4J_HOST}:${process.env.NEO4J_PORT}`, neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PWD));
    }catch(e){
        throw new Error("Could Not Connect to DB");
    }
    return driver;
}

async function close(driver, session){
    await session.close();
    await driver.close();
}

// eslint-disable-next-line no-undef
function addRelationship(nodeAMatchingQuery, nodeAParams, nodeBMatchingQuery, nodeBParams, relMatchingQuery, relParams, creationQuery, recordIds=[0], db = process.env.ARCHIVE_DB){
    const promise = new Promise( (resolve, reject) => {
        (async () => {
            let driver,
                sess;
            
            try{
                driver = connect();
                // eslint-disable-next-line no-undef
                sess = driver.session(getSessionOptions(db));
            }catch(e){
                reject(new DBError(DBError.COULD_NOT_CONNECT_TO_DB, 1001, e));
                return;
            }

            let resource = [];

            try{
                resource = await findResource(nodeAMatchingQuery, nodeAParams);
            }catch(e){
                await close(driver, sess);
                reject(new InternalError(ArchiveError.RESOURCE_SEARCH_ERROR, 1002, e));
                return;
            }

            if(resource.length === 0){
                await close(driver, sess);
                reject(new ArchiveError(ArchiveError.COULD_NOT_FIND_RESOURCE, 2011));
                return;
            }else{
                resource = [];

                try{
                    resource = await findResource(nodeBMatchingQuery, nodeBParams);
                }catch(e){
                    await close(driver, sess);
                    reject(new InternalError(ArchiveError.RESOURCE_SEARCH_ERROR, 1002, e));
                    return;
                }

                if(resource.length === 0){
                    await close(driver, sess);
                    reject(new ArchiveError(ArchiveError.COULD_NOT_FIND_RESOURCE, 2012));
                    return;
                }else{
                    resource = [];

                    try{
                        resource = await findResource(relMatchingQuery, relParams);
                    }catch(e){
                        await close(driver, sess);
                        reject(new InternalError(ArchiveError.RESOURCE_SEARCH_ERROR, 1002, e));
                        return;
                    }

                    if(resource.length > 0){
                        await close(driver, sess);
                        reject(new ArchiveError(ArchiveError.RESOURCE_ALREADY_EXISTS, 2013));
                        return;
                    }else{
                        const txc = sess.beginTransaction();
                        try{
                            const match = await txc.run(creationQuery, relParams);
                        
                            if(match.records.length === 1){
                                await txc.commit();
                                resolve(prepRecord(match.records[0], recordIds));
                                return;
                            }else{
                                await txc.rollback();
                                reject(new InternalError(ArchiveError.COULD_NOT_CREATE_RELATIONSHIP, 1017, `record length: ${match.records.length}`));
                                return;
                            }
                        
                        }catch(e){
                            reject(new InternalError(ArchiveError.COULD_NOT_CREATE_RELATIONSHIP, 1016, e));
                            return;
                        }finally{
                            await close(driver, sess);
                        }

                    }
                }

            }
            
        })();
    });

    return promise;
}

// eslint-disable-next-line no-undef
function addChildToParentResource(parentResourceMatchingQuery, parentResourceParams, newAttachmentQuery, childAttachQuery, childParams, recordIds=[0], db = process.env.ARCHIVE_DB){
    const promise = new Promise( (resolve, reject) => {
        (async ()=>{
            let driver,
                sess;

        try{
            driver = connect();
            // eslint-disable-next-line no-undef
            sess = driver.session(getSessionOptions(db));
        }catch(e){
            reject(new DBError(DBError.COULD_NOT_CONNECT_TO_DB, 1001, e));
            return;
        }
            
        let resource = [];

        try{
            resource = await findResource(parentResourceMatchingQuery, parentResourceParams, sess);
        }catch(e){
            await close(driver, sess);
            reject(new InternalError(ArchiveError.RESOURCE_SEARCH_ERROR, 1002, e));
            return;
        }

        if(resource.length === 0){
            await close(driver, sess);
            reject(new ArchiveError(ArchiveError.COULD_NOT_FIND_RESOURCE, 2009));
            return;
        }else{
            resource = [];

            try{
                resource = await findResource(newAttachmentQuery, childParams);
                
                if(resource.length >= 1)
                {
                    await close(driver,sess);
                    reject(new ArchiveError(ArchiveError.RESOURCE_ALREADY_EXISTS, 2011))
                    return;
                }else{
                    const txc = sess.beginTransaction();
                    let match;
                    try{
                        match = await txc.run(childAttachQuery, childParams);
                    }catch(e){
                        await txc.rollback();
                        await close(driver, sess);
                        reject(new InternalError(ArchiveError.COULD_NOT_ATTACH_CHILD_TO_PARENT_RESOURCE, 1007, e));
                        return;
                    }

                    if(match.records.length >= 1){
                        await txc.commit();
                        resolve({records: match.records.map(record => { return prepRecord(record, recordIds)}), summary: match.summary.counters._stats});
                    }else{
                        await txc.rollback();
                        await close(driver, sess);
                        reject(new InternalError(ArchiveError.COULD_NOT_ATTACH_CHILD_TO_PARENT_RESOURCE, 1009, match.records))
                    }
                }

            }catch(e){
                await close(driver, sess);
                reject(new InternalError(ArchiveError.COULD_NOT_FIND_RESOURCE, 1002, e));
                return;
            }
        }
        })()
    });

    return promise;
}

// eslint-disable-next-line no-undef
async function findResource(query, queryParams={}, session=null, db = process.env.ARCHIVE_DB){
    let driver,
        sess;

    if(session === null){
        driver = connect();
        // eslint-disable-next-line no-undef
        sess = driver.session(getSessionOptions(db));
    }else{
        sess = session;
    }

    const match = await sess.run(query, queryParams);

    if(session === null){
        await close(driver, sess);
    }

    return match.records;
}

function prepRecord(record, recordIds = [0]){
    let preppedRecord = [];
    
    recordIds.map(recordId => {
        let recorded = record.get(recordId);
        preppedRecord.push({labels: recorded.labels, properties: recorded.properties});
    });

    if(preppedRecord.length === 1) preppedRecord = preppedRecord[0];

    return preppedRecord;
}

// eslint-disable-next-line no-undef
function deleteResource(findingFunction, findingFunctionArgs, deletionQuery, queryParams, nodesToDelete = 1, relationshipsToDelete = null, db = process.env.ARCHIVE_DB){

    const promise = new Promise( (resolve, reject) => {
        (async () => {
            let driver, sess;

            try{
                driver = connect();
                // eslint-disable-next-line no-undef
                sess = driver.session(getSessionOptions(db));
            }catch(e){
                reject(new DBError(DBError.COULD_NOT_CONNECT_TO_DB, 1001, e));
                return;
            }
            
            let resource = [];
    
            try{
                resource = await findingFunction(...findingFunctionArgs);
            }catch(e){
                await close(driver, sess);
                reject(new InternalError(ArchiveError.RESOURCE_SEARCH_ERROR, 1002, e));
                return;
            }
        
            if(resource.length === 0){
                await close(driver, sess);
                reject(new ArchiveError(ArchiveError.COULD_NOT_FIND_RESOURCE, 2007));
                return;
            }else{
                try{
                    let txc = sess.beginTransaction();
                    
                    const match = await txc.run(deletionQuery, queryParams);
    
                    const nodesDeleted = match.summary.updateStatistics._stats.nodesDeleted;
                    const relationshipsDeleted = match.summary.updateStatistics._stats.relationshipsDeleted;
                    
                    if(nodesDeleted === nodesToDelete && (relationshipsToDelete === null || relationshipsToDelete === relationshipsDeleted)){
                        await txc.commit();
                        resolve();
                        return;
                    }else{
                        await txc.rollback();
                        reject(new InternalError(ArchiveError.NODES_DELETED_UNEXPECTED_NUMBER, 1008, `expected: ${nodesToDelete}, tried: ${nodesDeleted}`));
                        return;
                    }
                }catch(e){
                    if(e.toString().indexOf(DBError.STILL_HAS_RELATIONSHIPS_ERROR_STR)>=0){
                        reject(new ArchiveError(ArchiveError.RESOURCE_HAS_RELATIONSHIPS, 2008))
                        return;
                    }else{
                        reject(new InternalError(ArchiveError.COULD_NOT_DELETE_RESOURCE, 1004, e));
                        return;
                    }
                }finally{
                    await close(driver, sess);
                }
            }
        })()
    });

    return promise;
}

// eslint-disable-next-line no-undef
function createResource(findingQuery, queryParams, creationQuery, recordIds=[0], db = process.env.ARCHIVE_DB){

    const promise = new Promise( (resolve, reject ) =>{
        (async () => {
            let driver, sess;

            try{
                driver = connect();
                // eslint-disable-next-line no-undef
                sess = driver.session(getSessionOptions(db));
            }catch(e){
                reject(new DBError(DBError.COULD_NOT_CONNECT_TO_DB, 1001, e));
                return;
            }
    
            try{
                let resource = [];
                
                if(findingQuery !== null) resource = await findResource(findingQuery, queryParams, sess);
    
                if(resource.length >= 1){
                    reject(new ArchiveError(ArchiveError.RESOURCE_ALREADY_EXISTS, 2001));
                    return;
                }else{
                    let txc = sess.beginTransaction();
    
                    const match = await txc.run(creationQuery, queryParams);
                    
                    if(match.records.length === 1){
                        let preppedRecord;
                        try{
                            preppedRecord = prepRecord(match.records[0], recordIds);
                        }catch(e){
                            await txc.rollback();
                            reject(new InternalError(ArchiveError.COULD_NOT_PREP_RECORD, 1006, e));
                            return;
                        }
    
                        await txc.commit();
                        resolve({record: preppedRecord, summary: match.summary.counters._stats});
                        return;
                    }else{
                        await txc.rollback();
                        reject(new InternalError(ArchiveError.COULD_NOT_CREATE_RESOURCE, 1010, match.records));
                        return;
                    }
                }
            }catch(e){
                reject(new InternalError(ArchiveError.COULD_NOT_CREATE_RESOURCE, 1006, e))
                return;
            }finally{
                await close(driver, sess);
            }
        })()

    });

    return promise;
}

// eslint-disable-next-line no-undef
function getResource(findingFunction, findingFunctionArgs, recordIds = [0], db = process.env.ARCHIVE_DB){
    const promise = new Promise( (resolve, reject) =>{
        (async () => {
        let driver, sess;

        try{
            driver = connect();
            // eslint-disable-next-line no-undef
            sess = driver.session(getSessionOptions(db));
        }catch(e){
            reject(new DBError(DBError.COULD_NOT_CONNECT_TO_DB, 1001, e));
            return;
        }

        try{
            const foundRecords = await findingFunction(...findingFunctionArgs);
            
            if(foundRecords.length === 1){
                resolve(prepRecord(foundRecords[0], recordIds));
                return;
            }else if(foundRecords.length > 1){
                resolve(foundRecords.map(record => { return prepRecord(record, recordIds);}));
                return;
            }else{
                reject(new ArchiveError(ArchiveError.COULD_NOT_FIND_RESOURCE, 2007));
                return;
            }
        }catch(e){
            reject(new InternalError(ArchiveError.RESOURCE_SEARCH_ERROR, 1002, e));
            return;
        }finally{
            await close(driver, sess);
        }
        })()
        
    });

    return promise;
}

// eslint-disable-next-line no-undef
function getPath(pathQuery, pathParams, db = process.env.ARCHIVE_DB){
    const promise = new Promise( (resolve, reject) =>{
        (async () => {
        let driver, sess;

        try{
            driver = connect();
            // eslint-disable-next-line no-undef
            sess = driver.session(getSessionOptions(db));
        }catch(e){
            reject(new DBError(DBError.COULD_NOT_CONNECT_TO_DB, 1001, e));
            return;
        }

        try{
            const foundPaths = await findResource(pathQuery, pathParams, sess, db);
            if(foundPaths.length >= 1){
                
                const paths = [];

                foundPaths.forEach(foundPath => {
                    foundPath.get('path').segments.forEach(segment => {
                        //const link = {start: {labels: segment.start.labels, properties: segment.start.properties}, end: {labels: segment.end.labels, properties: segment.end.properties}, relType: segment.relationship.type, relProperties: segment.relationship.properties};
                        const link = prepLink(segment.start, segment.end, segment.relationship);
                        if(!paths.some(element => deepEqual(element, link)))
                        {
                            paths.push(link)
                        }
                    });
                })

                resolve(paths);
                return;
            }else{
                reject(new ArchiveError(ArchiveError.COULD_NOT_FIND_RESOURCE, 2014));
                return;
            }
        }catch(e){
            reject(new InternalError(ArchiveError.RESOURCE_SEARCH_ERROR, 1002, e));
            return;
        }finally{
            await close(driver, sess);
        }
        })()
        
    });

    return promise;
}

const prepLink = function(start, end, relationship){
    return {start: {labels: start.labels, properties: start.properties}, end: {labels: end.labels, properties: end.properties}, relationship: {type: relationship.type, properties: relationship.properties}}
}

const deepEqual = function (x, y) {
    if(x === y){
      return true;
    }else if((typeof x == "object" && x != null) && (typeof y == "object" && y != null)){
        if (Object.keys(x).length != Object.keys(y).length) return false;
  
        for (var prop in x) {
            if (Object.prototype.hasOwnProperty.call(y, prop)){  
                if (!deepEqual(x[prop], y[prop])) return false;
            }else{
                return false;
            }
        }
        return true;
    }else{ 
        return false;
    }
}

// eslint-disable-next-line no-undef
function updateResource(matchingQuery, queryParams, newMatchingQueryParams, updateQuery, updateParams, changedRecordIds=[0], db = process.env.ARCHIVE_DB){
    const promise = new Promise( (resolve, reject ) =>{
        (async () => {
        let driver, sess;

        try{
            driver = connect();
            // eslint-disable-next-line no-undef
            sess = driver.session(getSessionOptions(db));
        }catch(e){
            reject(new DBError(DBError.COULD_NOT_CONNECT_TO_DB, 1001, e));
            return;
        }

        try{
            const oldResource = await findResource(matchingQuery, queryParams, sess);
            
            if(oldResource.length === 0){
                reject(new ArchiveError(ArchiveError.COULD_NOT_FIND_RESOURCE, 2003));
                return;
            }
            let newResource = [];
            
            if(newMatchingQueryParams !== null) newResource = await findResource(matchingQuery, newMatchingQueryParams, sess);

            if(newResource.length >= 1){
                reject(new ArchiveError(ArchiveError.RESOURCE_ALREADY_EXISTS, 2004));
                return;
            }else{
                const txc = sess.beginTransaction();
                const match = await txc.run(updateQuery, updateParams);

                if(match.records.length === 1){
                    let preppedRecord;
                    try{
                        preppedRecord = prepRecord(match.records[0], changedRecordIds);
                    }catch(e){
                        await txc.rollback();
                        reject(new InternalError(ArchiveError.COULD_NOT_PREP_RECORD, 1006, e));
                        return;
                    }
                    
                    await txc.commit();
                    resolve({record: preppedRecord, summary: match.summary.counters._stats});
                    return;
                }else{
                    await txc.rollback();
                    reject(new InternalError(ArchiveError.COULD_NOT_UPDATE_RESOURCE, 1010, match.records));
                }
            }
        }catch(e){
            reject(new InternalError(ArchiveError.COULD_NOT_UPDATE_RESOURCE, 1005, e));
        }finally{
            await close(driver, sess);
        }
        })();
        
    });

    return promise;
}

module.exports = {
    connect,
    close,
    prepRecord,
    findResource,
    deleteResource,
    createResource,
    getResource,
    updateResource,
    addChildToParentResource,
    addRelationship,
    getPath,
    prepLink
}