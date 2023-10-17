const mongoose = require('mongoose');

const plantSchema = new mongoose.Schema({
    name: String,
    scientificName: String,
    wateringFrequency: Number,
    lastWatering: Date,
    growthConditions: String,
    shortInfo: String,
    plantImage: String,
    userId: String,
});

plantSchema.statics.deleteById = async function (plantId) {
    return this.findByIdAndDelete(plantId);
};

plantSchema.statics.updatePlant = async function (plantId, updatedPlantData) {
    return this.findByIdAndUpdate(plantId, updatedPlantData, { new: true });
};

module.exports = mongoose.model('Plant', plantSchema);
