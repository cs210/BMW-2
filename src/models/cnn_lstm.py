import torch
import torch.nn as nn
from torch.nn import functional as F


class CNN(nn.Module):
    def __init__(self, output_size):
        super().__init__()
        self.output_size = output_size
        self.conv1 = nn.Conv2d(1, 10, kernel_size=5)
        self.conv2 = nn.Conv2d(10, 20, kernel_size=5)
        self.conv2_drop = nn.Dropout2d()
        self.fc1 = nn.Linear(320, 50)
        self.fc2 = nn.Linear(50, 10)

    def forward(self, x):
        x = F.relu(F.max_pool2d(self.conv1(x), 2))
        x = F.relu(F.max_pool2d(self.conv2_drop(self.conv2(x)), 2))
        x = x.view(-1, self.output_size)
        return x


class CnnLSTM(nn.Module):
    def __init__(self):
        super().__init__()
        MAGIC = 500
        self.input_shape = torch.Size((6, 1, 32, 32))
        self.cnn = CNN(MAGIC)
        self.rnn = nn.LSTM(
            input_size=MAGIC,
            hidden_size=64,
            num_layers=1,
            batch_first=True)
        self.linear = nn.Linear(64, 10)

    def forward(self, x):
        batch_size, timesteps, C, H, W = x.size()
        c_in = x.view(batch_size * timesteps, C, H, W)
        c_out = self.cnn(c_in)
        r_in = c_out.view(batch_size, timesteps, -1)
        r_out, (h_n, h_c) = self.rnn(r_in)
        r_out2 = self.linear(r_out[:, -1, :])
        return F.log_softmax(r_out2, dim=1)
