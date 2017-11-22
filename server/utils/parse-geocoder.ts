/**
 * parseGeoCoder will translate the first result of a google geocoder json object
 */
export default function parseGeocoder(json: any): Object {
  if (!json['results']) {
    return {};
  }
  
  if (json['results'].length < 1) {
    return {};
  }
  
  let result: any = {};
  
  // Add formatted_address
  result['address'] = json['results'][0]['formatted_address'];
  
  // Add coordinates
  result['latitude'] = json['results'][0]['geometry']['location']['lat'];
  result['longitude'] = json['results'][0]['geometry']['location']['lng'];
  
  // Parse components
  let components = parseComponents(json['results'][0]['address_components']);
  
  // Add locality
  result['city'] = components['locality'];
  
  // Add state
  result['state'] = components['administrative_area_level_1'];
  
  // Add country
  result['country'] = components['country'];
  
  return result;
}

function parseComponents(address: any) {
  let result: any = {};
  address.forEach((component: any) => {
    if (component.types[0] == 'country') {
      result[component.types[0]] = component['long_name'];
      if (component['short_name'] == 'USA') {
        result[component.types[0]] = component['short_name'];
      }
    } else {
      result[component.types[0]] = component['short_name'];
    }
  });
  return result;
}

