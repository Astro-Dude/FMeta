// Quick test to add sample posts for testing
import mongoose from 'mongoose';
import User from './src/models/user.model.js';
import Post from './src/models/post.model.js';
import dotenv from 'dotenv';

dotenv.config();

const addSamplePosts = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.dbURL);
    console.log('Connected to MongoDB');

    // Find any user to add posts to
    const users = await User.find().limit(3);
    
    if (users.length === 0) {
      console.log('No users found. Please register a user first.');
      return;
    }

    console.log(`Found ${users.length} users`);

    for (const user of users) {
      // Create 3-5 sample posts for each user
      const postCount = Math.floor(Math.random() * 3) + 3; // 3-5 posts
      
      for (let i = 0; i < postCount; i++) {
        const post = new Post({
          author: user._id,
          content: [
            "Living my best life ✨",
            "Beautiful sunset today 🌅", 
            "Great day with friends! 🎉",
            "Nature is amazing 🌿",
            "Coffee and coding ☕💻",
            "Weekend vibes 🌸"
          ][i % 6],
          images: [`https://picsum.photos/600/600?random=${Date.now()}-${i}`],
          likes: [], // Start with empty likes array
          comments: [], // Start with empty comments array
          hashtags: ['#lifestyle', '#photo', '#mood']
        });

        await post.save();
        
        // Add post ID to user's posts array
        user.posts.push(post._id);
      }
      
      // Add some sample followers/following and bio
      const bios = [
        "Coffee lover ☕ | Travel enthusiast 🌍 | Capturing life's moments 📸",
        "Digital nomad 💻 | Sunset chaser 🌅 | Living my best life ✨",
        "Photographer 📷 | Nature lover 🌿 | Adventure seeker 🏔️",
        "Foodie 🍕 | Book reader 📚 | Weekend warrior 🎯",
        "Tech enthusiast 💻 | Gamer 🎮 | Music lover 🎵"
      ];
      
      user.bio = bios[Math.floor(Math.random() * bios.length)];
      user.followers = users.filter(u => u._id.toString() !== user._id.toString()).map(u => u._id).slice(0, 2);
      user.following = users.filter(u => u._id.toString() !== user._id.toString()).map(u => u._id).slice(0, 1);
      
      await user.save();
      console.log(`Added ${postCount} posts for user ${user.username}`);
    }

    console.log('Sample data added successfully!');
    
  } catch (error) {
    console.error('Error adding sample data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

addSamplePosts();
