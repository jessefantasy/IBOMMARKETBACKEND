import UserVisitsSchema from "../schema/userVsits.js";

// Step 1: Find the user document

const handleTrackUUID = async (uuid, subCategory, propertyId) => {
  const userVisits = await UserVisitsSchema.findOne({ uuid });
  if (userVisits) {
    // Step 2: Find the visitData entry with the matching name
    const visitEntry = userVisits.visitData.find((v) => v.name === subCategory);

    if (visitEntry) {
      // Step 3: Check if the propertyId exists in the propertyId array
      const propertyExists = visitEntry.propertyId.includes(propertyId);

      if (propertyExists) {
        console.log("propertyId exists for this name");
      } else {
        console.log("propertyId does NOT exist for this name");
        visitEntry.propertyId.push(propertyId); // Add propertyId to the array
        await userVisits.save();
      }
    } else {
      // Add a new subCategory entry to visitData
      userVisits.visitData.push({
        name: subCategory,
        propertyId: [propertyId],
      });
      await userVisits.save();
    }
  } else {
    const newUserVisits = new UserVisitsSchema({
      uuid,
      visitData: [{ name: subCategory, propertyId: [propertyId] }],
    });
    await newUserVisits.save();
  }
};

export default handleTrackUUID;



// recommendation
// notifcation
// feedback
// performance
// faq
// mesaging
// report abuse
// followers


