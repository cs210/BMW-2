import sys
import pandas as pd
import torch
from torch.utils.data import DataLoader, random_split
from torch.utils.data.dataset import Dataset
from torch.utils.data.dataloader import default_collate
from torchvision import datasets, transforms
if 'google.colab' in sys.modules:
    DATA_PATH = '/content/'
else:
    DATA_PATH = 'data/'


CLASS_LABELS = ['None', 'Thumbs Up', 'Swipe Left', 'Swipe Right']


def get_collate_fn(device):
    def to_device(b):
        return list(map(to_device, b)) if isinstance(b, (list, tuple)) else b.to(device)
    return lambda x: map(to_device, default_collate(x))


def load_train_data(args, device, num_examples=None, val_split=0.2):
    norm = get_transforms()
    collate_fn = get_collate_fn(device)
    orig_dataset = RadarDataset('train', transform=norm)
    if num_examples:
        data_split = [num_examples, num_examples, len(orig_dataset) - 2 * num_examples]
        train_set, val_set = random_split(orig_dataset, data_split)[:-1]
    else:
        data_split = [int(part * len(orig_dataset)) for part in (1 - val_split, val_split)]
        train_set, val_set = random_split(orig_dataset, data_split)
    train_loader = DataLoader(train_set,
                              batch_size=args.batch_size,
                              shuffle=True,
                              collate_fn=collate_fn)
    val_loader = DataLoader(val_set,
                            batch_size=args.batch_size,
                            collate_fn=collate_fn)
    return train_loader, val_loader, []


def load_test_data(args, device):
    norm = get_transforms()
    collate_fn = get_collate_fn(device)
    test_set = RadarDataset('test', transform=norm)
    test_loader = DataLoader(test_set,
                             batch_size=args.test_batch_size,
                             collate_fn=collate_fn)
    return test_loader


def get_transforms(img_dim=None):
    return transforms.Compose([
        transforms.ToTensor(),
        # transforms.Normalize((0.1307,), (0.3081,))
    ])


class RadarDataset(Dataset):
    ''' Dataset for training a model on a dataset. '''
    def __init__(self, mode, transform=None):
        super().__init__()
        # self.label = pd.read_csv(data_path)
        INPUT_SHAPE = (6, 1, 32, 32)
        NUM_EXAMPLES = 10
        self.data = torch.randn((NUM_EXAMPLES, *INPUT_SHAPE))
        self.labels = torch.randint(len(CLASS_LABELS), (NUM_EXAMPLES,))

    def __len__(self):
        return self.data.shape[0]

    def __getitem__(self, index):
        return self.data[index], self.labels[index]
