// [name, age, city/college, bio, interests]
const RAW = [
  ['Aanya', 22, 'Delhi University', 'Chai over coffee, always. Will beat you at Uno.', ['Reading', 'Chai', 'Indie music']],
  ['Rohan', 24, 'Bengaluru', 'Weekend trekker, weekday spreadsheet person.', ['Trekking', 'Cricket', 'Startups']],
  ['Meera', 21, 'IIT Bombay', 'Building robots and bad puns.', ['Robotics', 'Puns', 'Badminton']],
  ['Kabir', 25, 'Mumbai', 'Street photographer chasing golden hour.', ['Photography', 'Travel', 'Street food']],
  ['Ishita', 23, 'Pune', 'Classical dancer who also loves hip hop.', ['Dance', 'Hip hop', 'Cooking']],
  ['Arjun', 26, 'Hyderabad', 'Biryani critic. Strong opinions, open mind.', ['Food', 'Football', 'Podcasts']],
  ['Naina', 20, 'Christ University', 'Poetry, plants and pretty bad parallel parking.', ['Poetry', 'Plants', 'Driving']],
  ['Vihaan', 24, 'Chennai', 'Surfer in a landlocked heart.', ['Surfing', 'Guitar', 'Movies']],
  ['Sara', 22, 'Jamia Millia Islamia', 'Debate club survivor. Ask me anything.', ['Debate', 'Politics', 'Coffee']],
  ['Dev', 27, 'Gurugram', 'Product manager who actually likes people.', ['Product', 'Padel', 'Board games']],
  ['Tara', 23, 'Kolkata', 'Rooftop chai and old Bengali films.', ['Cinema', 'Chai', 'Sketching']],
  ['Yash', 21, 'BITS Pilani', 'Hackathon addict. Sleep is optional.', ['Coding', 'Gaming', 'Gym']],
  ['Riya', 25, 'Jaipur', 'Block-print enthusiast and weekend baker.', ['Baking', 'Crafts', 'Travel']],
  ['Aditya', 28, 'Noida', 'Marathon runner, terrible singer.', ['Running', 'Karaoke', 'Fitness']],
  ['Zoya', 22, 'Lucknow', 'Shayari at midnight, memes at noon.', ['Shayari', 'Memes', 'Cooking']],
  ['Karan', 24, 'Chandigarh', 'Bike rides to Manali, no destination needed.', ['Biking', 'Mountains', 'Dhabas']],
  ['Pooja', 26, 'Ahmedabad', 'Garba champion three years running.', ['Garba', 'Fashion', 'Yoga']],
  ['Neil', 23, 'Goa', 'Beach bum with a laptop.', ['Beaches', 'Design', 'Surfing']],
  ['Sneha', 21, 'Symbiosis Pune', 'Psychology student. Yes, I am analysing you.', ['Psychology', 'Journaling', 'Thrift']],
  ['Aarav', 25, 'Indore', 'Poha evangelist. Cricket tragic.', ['Cricket', 'Food', 'Stand-up']],
  ['Diya', 22, 'Mumbai University', 'Illustrator, night owl, cat person.', ['Illustration', 'Cats', 'Anime']],
  ['Rahul', 29, 'Bengaluru', 'Techie who quit meetings for pottery.', ['Pottery', 'Cycling', 'Coffee']],
  ['Kiara', 24, 'Delhi', 'Always planning the next trip.', ['Travel', 'Photography', 'Wine']],
  ['Manav', 23, 'Manipal', 'Football on the field, FIFA off it.', ['Football', 'Gaming', 'Music']],
  ['Anika', 20, 'Ashoka University', 'Philosophy major. Overthinking is a hobby.', ['Philosophy', 'Books', 'Tea']],
  ['Sahil', 26, 'Surat', 'Gym at 6am, memes at 6:05.', ['Gym', 'Memes', 'Cars']],
  ['Ira', 22, 'Shillong', 'Folk guitar and hill sunsets.', ['Guitar', 'Folk music', 'Hiking']],
  ['Veer', 27, 'Kochi', 'Chef in training, taster by nature.', ['Cooking', 'Seafood', 'Travel']],
  ['Myra', 24, 'Bhopal', 'Volunteer, runner, dog mom.', ['Dogs', 'Volunteering', 'Running']],
  ['Ayaan', 21, 'Ahmedabad', 'Architecture student sketching everything.', ['Architecture', 'Sketching', 'Jazz']],
  ['Shreya', 25, 'Nagpur', 'Stand-up open mics on Fridays.', ['Comedy', 'Writing', 'Coffee']],
  ['Ritvik', 23, 'IIM Indore', 'Chess nerd with a social side.', ['Chess', 'Finance', 'Quizzing']],
  ['Tanvi', 22, 'Pune', 'Carnatic singer, cafe hopper.', ['Singing', 'Cafes', 'Reading']],
  ['Harsh', 28, 'Vadodara', 'Wildlife photographer, patient to a fault.', ['Wildlife', 'Photography', 'Safari']],
  ['Pari', 21, 'Mumbai', 'Fashion design student, thrift flip queen.', ['Fashion', 'Thrift', 'Dance']],
  ['Nikhil', 25, 'Hyderabad', 'Climbing walls, cracking jokes.', ['Climbing', 'Comedy', 'Movies']],
];

// Small seeded PRNG so the feed order is fixed but unrelated to who liked you.
function shuffle(arr, seed) {
  let s = seed;
  const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function seedProfiles() {
  const profiles = RAW.map(([name, age, place, bio, interests], i) => ({
    id: i + 1,
    name,
    age,
    place,
    bio,
    interests,
    photo: `/photo?id=${i + 1}`,
    likedYou: i % 3 === 0, // server-only; never sent to clients
  }));
  return shuffle(profiles, 42);
}
