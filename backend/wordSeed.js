const mongoose = require("mongoose");
const Words = require("./model/Words.js");
require('dotenv').config();
const words = [
"Anchor","Angel","Ant","Apple","Arm","Army","Atlantis","Banana","Bank","Bark",
"Battleship","Beach","Bear","Beat","Bed","Belt","Berlin","Berry","Bike","Bill",
"Blade","Block","Board","Bolt","Bomb","Bond","Boot","Bottle","Bow","Box","Bridge",
"Brush","Bucket","Bug","Bulb","Bull","Button","Cactus","Cage","Cake","Camel","Camera",
"Canada","Cape","Car","Card","Carrot","Castle","Cat","Cell","Center","Chair","Chalk",
"Change","Charge","Check","Chef","Chess","Chicken","Chocolate","Church","Circle",
"Clock","Cloud","Club","Coach","Coal","Coast","Code","Coin","Cold","Comet","Compass",
"Concert","Cook","Cotton","Court","Cow","Crane","Crash","Cream","Cross","Crown",
"Crystal","Cup","Cycle","Dance","Date","Day","Death","Desk","Diamond","Dice","Dinosaur",
"Doll","Dollar","Door","Dragon","Dress","Drill","Drop","Duck","Dust","Eagle","Earth",
"Engine","England","Europe","Eye","Face","Fair","Fall","Fan","Farm","Feather","Fence",
"Field","File","Film","Fire","Fish","Flag","Flame","Flash","Flight","Flood","Flower",
"Fly","Foot","Forest","Fork","France","Game","Garden","Gas","Gate","Gear","Ghost",
"Gift","Glass","Glove","Goat","Gold","Grape","Grass","Greece","Green","Guitar",
"Hair","Hammer","Hand","Harbor","Hat","Head","Heart","Helicopter","Hill","Honey",
"Hood","Hook","Horn","Horse","Hospital","Hot","Hotel","Ice","Iceberg","Igloo",
"Island","Jack","Jacket","Jelly","Jewel","Jungle","Key","King","Kitchen","Kitten",
"Knife","Knight","Lab","Lake","Lamp","Laser","Leaf","Leather","Leg","Library","Light",
"Line","Lion","Lizard","Lock","Log","London","Luck","Machine","Magazine","Magic",
"Mail","Map","March","Mars","Mask","Match","Mercury","Metal","Microscope","Milk",
"Mirror","Model","Moon","Moscow","Mountain","Mouse","Mud","Mummy","Music","Nail",
"Neck","Needle","Net","Night","Ninja","Nose","Note","Nurse","Ocean","Oil","Olympus",
"Onion","Opera","Orange","Oven","Paddle","Page","Paint","Panda","Paper","Park",
"Parrot","Party","Password","Peach","Pen","Pencil","Penguin","Piano","Picture",
"Pig","Pilot","Pin","Pipe","Pirate","Pizza","Plane","Planet","Plastic","Plate",
"Plum","Pocket","Poison","Police","Pool","Popcorn","Port","Post","Potato","Princess",
"Pumpkin","Pyramid","Queen","Rabbit","Race","Radar","Rain","Rainbow","Ranch",
"Reef","Ring","River","Robot","Rocket","Roof","Room","Root","Rose","Ruler","Salt",
"Sand","Sandwich","Scale","School","Science","Scissors","Ship","Shirt","Shoe","Shop",
"Shower","Signal","Silver","Sink","Skate","Skin","Sky","Sleep","Slide","Smoke",
"Snake","Snow","Sock","Soldier","Sound","Space","Spider","Spine","Spoon","Spring",
"Square","Stamp","Star","State","Stick","Stone","Storm","Story","Straw","Stream",
"Sun","Table","Tag","Tail","Tank","Tap","Teacher","Temple","Tent","Thief","Thumb",
"Ticket","Tiger","Time","Toast","Tooth","Torch","Tower","Track","Train","Tree",
"Triangle","Trip","Truck","Tube","Turkey","Umbrella","Unicorn","Van","Vase","Vegetable",
"Village","Violet","Volcano","Wagon","Wall","War","Watch","Water","Whale","Wheel",
"Whip","Wind","Window","Wing","Wire","Witch","Wolf","Wood","Wool","World","Worm",
"Zebra"
];


(async () => {
	await mongoose.connect(process.env.MONGO_URL);
	await Words.insertMany(words.map(w => ({ text: w })));
	console.log("✅ Words Inserted");
	process.exit();
})();
