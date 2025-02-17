
export const getAllLockers = async (req, res) => {
    try {
        res.status(200).json({ message: 'Get all lockers' });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const getLockerById = async (req, res) => {
    try {
        res.status(200).json({ message: 'Get locker by id' + req.params.id });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const createLocker = async (req, res) => {
    try {
        res.status(200).json({ message: 'Create locker' });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const updateStatusLocker = async (req, res) => {
    try {
        res.status(200).json({ message: 'Update locker' + req.params.id });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}