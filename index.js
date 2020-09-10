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
let module_name, botpress_home;
const BOTPRESS_CONFIG_JSON_PATH = `${path.sep}out${path.sep}bp${path.sep}data${path.sep}global${path.sep}botpress.config.json`;

let applicationProperties = {
    module_name: "custom-module",
    module_label: "Custom Module",
    module_description: "Some description on what this module is about",
    botpress_home: ""
}
const locationLookup = (type) => {
    if (type[0] === "api_ts") {
        return `${applicationProperties["botpress_home"]}${path.sep}modules${path.sep}${applicationProperties["module_name"]}${path.sep}src${path.sep}backend${path.sep}`;
    } else if (type[0] === "index_ts") {
        return `${applicationProperties["botpress_home"]}${path.sep}modules${path.sep}${applicationProperties["module_name"]}${path.sep}src${path.sep}backend${path.sep}`;
    } else if (type[0] === "package_json") {
        return `${applicationProperties["botpress_home"]}${path.sep}modules${path.sep}${applicationProperties["module_name"]}${path.sep}`;
    }
    /*"api_ts" : `${applicationProperties["botpress_home"]}${path.sep}modules${path.sep}${applicationProperties["module_name"]}${path.sep}src${path.sep}backend${path.sep}`,
    "index_ts" : `${applicationProperties["botpress_home"]}${path.sep}modules${path.sep}${applicationProperties["module_name"]}${path.sep}src${path.sep}backend${path.sep}`,
    "package_json" : `${applicationProperties["botpress_home"]}${path.sep}modules${path.sep}${applicationProperties["module_name"]}${path.sep}`*/
};

/**Prompt user to get mandatory details */
const getModuleDetails = async () => new Promise((resolve, reject) => {
    prompt.start();
    prompt.get(properties, function (err, result) {
        if (err) { return onErr(err); }
        applicationProperties["module_name"] = module_name = result.module_name;
        applicationProperties["module_label"] = module_name = result.module_label;
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

/**Adds the newly created module to your botpress instance */
const stitchModule = () => {
    try {
        const ENCODING = 'utf-8', LOCATION = `.${path.sep}template${path.sep}`;
        let obj = JSON.parse(fs.readFileSync(`${applicationProperties['botpress_home']}${BOTPRESS_CONFIG_JSON_PATH}`, {encoding:ENCODING, flag:'r'}));
        let result = Mustache.render(loadTemplate(LOCATION + "module_template.mustache"), applicationProperties);
        
        obj.modules.push(JSON.parse(result));
        fs.writeFileSync(`${applicationProperties['botpress_home']}${BOTPRESS_CONFIG_JSON_PATH}`, JSON.stringify(obj, null, 4));
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
            fs.writeFileSync(locationLookup([file.substr(0, file.indexOf('.'))])+filename, result);
        });
        stitchModule();
        console.log(`${applicationProperties['module_name']} created successfully at ${applicationProperties['botpress_home']}${path.sep}modules location.`);
    } catch(err) {
        console.error(err)
    }
}

const init = async () => {
    await createModule();
}

init();