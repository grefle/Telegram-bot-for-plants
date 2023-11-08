const mapField = (fieldName) => {
  switch (fieldName) {
    case 'Назва':
      return 'name';
    case 'Біологічна назва':
      return 'scientificName';
    case 'Частота поливань':
        return 'wateringFrequency';
    case 'Умови росту':
        return 'growthConditions';
    case 'Коротка інформація':
        return 'shortInfo';
    case 'Картинка рослини':
        return 'plantImage';
    default:
      return 'undefiend';
  }
}; 

module.exports = {
  mapField,
};
