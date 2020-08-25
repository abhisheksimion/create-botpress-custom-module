const prompt = require('prompt');
const Mustache = require('mustache');
const fs = require('fs'); 
const fsxtra = require('fs-extra');
const path = require('path');

const properties = [
    {
        name: 'module_name',
        default: 'custom-module',
        description: "Name your Botpress module",
        type: 'string'
    },
    {
        name: 'module_label',
        default: 'Custom Module',
        description: 'Display name for your custom module',
        type: 'string'
    },
    {
        name: 'module_description',
        default: 'Some description on what this module is about',
        description: 'Description for your custom module',
        type: 'string'
    },
    {
        name: 'botpress_home',
        description: "Provide Botpres Home location (absolute path)",
        message: "Your Botpress Home location should be a clone of Botpress Github repo and should have package.json",
        type: 'string',
        required: true
    }
];
let module_name;
let botpress_home;

let applicationProperties = {
    module_name: "custom-module",
    module_label: "Custom Module",
    module_description: "Some description on what this module is about",
    botpress_home: `D:${path.sep}tools${path.sep}botpress${path.sep}source${path.sep}botpress-master-12105${path.sep}`
}
let locationLookup = {
    api_ts : `${applicationProperties["botpress_home"]}modules${path.sep}${applicationProperties["module_name"]}${path.sep}src${path.sep}backend${path.sep}`,
    index_ts : `${applicationProperties["botpress_home"]}modules${path.sep}${applicationProperties["module_name"]}${path.sep}src${path.sep}backend${path.sep}`,
    package_json : `${applicationProperties["botpress_home"]}modules${path.sep}${applicationProperties["module_name"]}${path.sep}`
}

/**Prompt user to get mandatory details */
const getModuleDetails = async () => new Promise((resolve, reject) => {
    prompt.start();
    prompt.get(properties, function (err, result) {
        if (err) { return onErr(err); }
        applicationProperties["module_name"] = module_name = result.module_name;
        applicationProperties["module_description"] = botpress_home = result.module_description;
        applicationProperties["botpress_home"] = botpress_home = result.botpress_home;
        resolve(result);
    });
})

/**Load template file given a location */
const loadTemplate = (location) => {
    return fs.readFileSync(location).toString();
}

/**Copies basic/complete module as baseline for custom module */
const copyModule = (masterModule) => {
    try {
        fsxtra.copySync(`${applicationProperties['botpress_home']}${path.sep}examples${path.sep}module-templates${path.sep}${masterModule}`, `${applicationProperties['botpress_home']}${path.sep}modules${path.sep}${applicationProperties['module_name']}`)
        //console.debug(`${applicationProperties['module_name']} copied successfully!`)
    } catch (err) {
        console.error(err)
    }
}

/**Copies and creates custom module */
const createModule = async () => {
    try {
        await getModuleDetails();
        let location = `.${path.sep}template${path.sep}complete-module${path.sep}`
        copyModule('complete-module');
        fs.readdirSync(location).forEach(file => {
            let result = Mustache.render(loadTemplate(location + file), applicationProperties);
            filename = file.substr(0, file.indexOf('.')).replace('_', '.')
            
            fs.writeFile(locationLookup[file.substr(0, file.indexOf('.'))]+filename, result, function (err) {
                if (err) return console.log(err);
                //console.log(`${locationLookup[file.substr(0, file.indexOf('.'))]+filename} file created.`);
            });
        });
        console.log(`${applicationProperties['module_name']} created successfully at ${applicationProperties['botpress_home']}${path.sep}modules location.`);
    } catch(err) {
        console.error(err)
    }
}

const init = async () => {
    await createModule();
}

init();