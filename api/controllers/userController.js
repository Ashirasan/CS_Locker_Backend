
export const getAllUsers = async (req, res) => {
  try {
    res.status(200).json({ message: 'Get all users' });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
}