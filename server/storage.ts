import { users, type User, type InsertUser, type TokenResult } from "@shared/schema";

// Define a structure to store token check results
export interface SavedTokenData {
  token: string;
  userId: string;
  username: string;
  timestamp: number;
  valid: boolean;
}

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Methods for token storage
  saveTokenCheck(result: TokenResult): Promise<SavedTokenData | null>;
  getAllSavedTokens(): Promise<SavedTokenData[]>;
  getSavedTokensByUserId(userId: string): Promise<SavedTokenData[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private checkedTokens: Map<string, SavedTokenData>;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.checkedTokens = new Map();
    this.currentId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Save a token check result
  async saveTokenCheck(result: TokenResult): Promise<SavedTokenData | null> {
    // Only save valid tokens with user data
    if (result.valid && result.user) {
      const savedData: SavedTokenData = {
        token: result.token,
        userId: result.user.id,
        username: result.user.username,
        timestamp: Date.now(),
        valid: true
      };
      
      // Store in memory
      this.checkedTokens.set(result.token, savedData);
      console.log(`Saved token for user ${savedData.username} (${savedData.userId})`);
      return savedData;
    }
    
    return null;
  }
  
  // Get all saved tokens
  async getAllSavedTokens(): Promise<SavedTokenData[]> {
    return Array.from(this.checkedTokens.values());
  }
  
  // Get tokens by user ID
  async getSavedTokensByUserId(userId: string): Promise<SavedTokenData[]> {
    return Array.from(this.checkedTokens.values()).filter(
      (tokenData) => tokenData.userId === userId
    );
  }
}

export const storage = new MemStorage();
